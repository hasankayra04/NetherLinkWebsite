import { useState, useEffect, useRef } from "react";
import { FaDiscord, FaStar, FaBook, FaChevronDown, FaSearch, FaCode, FaTachometerAlt, FaHandshake, FaHeart, FaBug, FaCircle, FaLayerGroup, FaFlask, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useHistory, useLocation } from "@docusaurus/router";
import sidebars from "../../../sidebars.js";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseClient.js";
import { useAuth } from "../../useAuth.js";

const NL = {
  surface: "#191c23",
  elevated: "#1f232c",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.12)",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  accent: "#67e404",
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
  const [toolsDrop, setToolsDrop] = useState(false);
  const [toolsDropMobile, setToolsDropMobile] = useState(false);
  const [moreDrop, setMoreDrop] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();
  const wikiRef = useRef();
  const toolsRef = useRef();
  const moreRef = useRef();
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
    setDrawerOpen(false); setWikiDrop(false); setWikiDropMobile(false); setMoreDrop(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = e => { if (wikiRef.current && !wikiRef.current.contains(e.target)) setWikiDrop(false); };
    if (wikiDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [wikiDrop]);

  useEffect(() => {
    const h = e => { if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsDrop(false); };
    if (toolsDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [toolsDrop]);

  useEffect(() => {
    const h = e => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreDrop(false); };
    if (moreDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [moreDrop]);

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

  function navigate(path) {
    history.push(path);
    setDrawerOpen(false); setWikiDrop(false); setWikiDropMobile(false);
  }

  async function handleSignOut() {
    try { await signOut(auth); } catch (_) { }
    navigate("/");
  }

  const portalLink = role === "admin"
    ? { label: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt size={13} /> }
    : role === "partner"
      ? { label: "Dashboard", path: "/dashboard", icon: <FaHandshake size={13} /> }
      : role === "user"
        ? { label: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt size={13} /> }
        : null;

  const drawerBtn = (color = NL.secondary) => ({
    ...btnReset,
    display: "flex", alignItems: "center", gap: 8,
    width: "100%", padding: "11px 12px", borderRadius: 8,
    fontSize: 13, fontWeight: 500, color,
  });
  const drawerEnter = e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; };
  const drawerLeave = (color = NL.secondary) => e => { e.currentTarget.style.color = color; e.currentTarget.style.background = "none"; };

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

        <div onClick={() => history.push("/")} style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none", flexShrink: 0 }}>
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
                Wiki
                <FaChevronDown size={9} style={{ transition: "transform 0.2s", transform: wikiDrop ? "rotate(180deg)" : "none" }} />
              </button>
              {wikiDrop && DOC_SIDEBAR.length > 0 && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 220,
                  background: NL.surface, border: `1px solid ${NL.borderMid}`,
                  borderRadius: 12, padding: 6,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 1001,
                  maxHeight: "calc(100vh - 100px)", overflowY: "auto",
                }}>
                  <SidebarDropdown items={DOC_SIDEBAR} onClose={() => setWikiDrop(false)} />
                </div>
              )}
            </div>

            <div ref={toolsRef} style={{ position: "relative" }}>
              <button onClick={() => setToolsDrop(x => !x)} style={{
                ...btnReset,
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 10px", borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                color: toolsDrop ? NL.text : NL.secondary,
                background: toolsDrop ? NL.elevated : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { if (!toolsDrop) { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; } }}
              >
                Tools
                <FaChevronDown size={9} style={{ transition: "transform 0.2s", transform: toolsDrop ? "rotate(180deg)" : "none" }} />
              </button>
              {toolsDrop && (
                <div style={{
                  position: "absolute", left: 0, top: "calc(100% + 8px)", minWidth: 180,
                  background: NL.surface, border: `1px solid ${NL.borderMid}`,
                  borderRadius: 12, padding: 6,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 1001,
                }}>
                  {[
                    { label: "Player Lookup", path: "/lookup", icon: <FaSearch size={12} /> },
                    { label: "RP Merger", path: "/rpeditor", icon: <FaLayerGroup size={12} /> },
                    { label: "Server Metrics", path: "/metrics", icon: <FaCode size={12} /> },
                  ].map(item => (
                    <button key={item.path} onClick={() => { navigate(item.path); setToolsDrop(false); }}
                      style={{ ...btnReset, display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 13, color: NL.secondary }}
                      onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                      onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "transparent"; }}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              { label: "Bug Report", path: "/feedback" },
              { label: "API", path: "/api-docs" },
              { label: "Partner Program", path: "/partner" },
              { label: "Beta", path: "/beta", icon: <FaFlask size={11} /> },
              { label: "Status", path: "/status", dot: true },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ ...btnReset, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: NL.secondary }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; }}
              >
                {item.dot && <FaCircle size={7} style={{ color: "#67e404" }} />}
                {item.icon && item.icon}
                {item.label}
              </button>
            ))}

            <a href="https://discord.gg/xvaNzE35Rs" target="_blank" rel="noopener noreferrer" title="Discord"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, color: "#7289da", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#7289da"; e.currentTarget.style.background = "none"; }}
            >
              <FaDiscord size={15} />
            </a>

            <a href="https://github.com/sponsors/MCCORG" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600, color: NL.accent, textDecoration: "none", background: "rgba(103,228,4,0.08)", border: "1px solid rgba(103,228,4,0.20)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(103,228,4,0.15)"; e.currentTarget.style.borderColor = "rgba(103,228,4,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(103,228,4,0.08)"; e.currentTarget.style.borderColor = "rgba(103,228,4,0.20)"; }}
            >
              <FaHeart size={12} /> Sponsor
            </a>

            <span style={{ width: 1, height: 18, background: NL.border, margin: "0 4px" }} />

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

            <button onClick={() => setToolsDropMobile(x => !x)} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            >
              <FaLayerGroup size={13} /> Tools
              <FaChevronDown size={10} style={{ marginLeft: "auto", transform: toolsDropMobile ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {toolsDropMobile && (
              <div style={{ paddingLeft: 12, borderLeft: `2px solid ${NL.border}`, marginLeft: 12, marginBottom: 4 }}>
                {[
                  { label: "Player Lookup", path: "/lookup" },
                  { label: "RP Merger", path: "/rpeditor" },
                  { label: "Server Metrics", path: "/metrics" },
                ].map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)} style={drawerBtn()}
                    onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
                  >{item.label}</button>
                ))}
              </div>
            )}

            <button onClick={() => navigate("/beta")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaFlask size={13} /> Beta</button>

            <button onClick={() => navigate("/feedback")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaBug size={13} /> Bug Report</button>

<button onClick={() => navigate("/api-docs")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaCode size={13} /> API</button>

            <button onClick={() => navigate("/partner")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaStar size={14} /> Partner Program</button>

            <button onClick={() => navigate("/status")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaCircle size={9} style={{ color: "#67e404" }} /> Status</button>

            <a href="https://discord.gg/xvaNzE35Rs" target="_blank" rel="noopener noreferrer"
              onClick={() => setDrawerOpen(false)}
              style={{ ...drawerBtn("#7289da"), textDecoration: "none" }}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave("#7289da")}
            ><FaDiscord size={14} /> Discord</a>

            <a href="https://github.com/sponsors/MCCORG" target="_blank" rel="noopener noreferrer"
              onClick={() => setDrawerOpen(false)}
              style={{ ...drawerBtn(NL.accent), textDecoration: "none" }}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave(NL.accent)}
            ><FaHeart size={13} /> Sponsor</a>

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