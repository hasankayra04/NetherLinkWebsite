import { useState, useEffect, useRef } from "react";
import { FaDiscord, FaStar, FaBook, FaChevronDown, FaSearch, FaCode, FaTachometerAlt, FaHandshake, FaHeart, FaBug } from "react-icons/fa";
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
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef();
  const wikiRef = useRef();
  const history = useHistory();
  const location = useLocation();
  const { user, role } = useAuth();

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setDrawerOpen(false); setWikiDrop(false); setWikiDropMobile(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = e => { if (wikiRef.current && !wikiRef.current.contains(e.target)) setWikiDrop(false); };
    if (wikiDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [wikiDrop]);

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setDrawerOpen(false); };
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
    : role === "member"
      ? { label: "Partner Portal", path: "/partner", icon: <FaHandshake size={13} /> }
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
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 7,
                fontSize: 13, fontWeight: 500,
                color: wikiDrop ? NL.text : NL.secondary,
                background: wikiDrop ? NL.elevated : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { if (!wikiDrop) { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; } }}
              >
                <FaBook size={13} /> Wiki
                <FaChevronDown size={10} style={{ transition: "transform 0.2s", transform: wikiDrop ? "rotate(180deg)" : "none" }} />
              </button>
              {wikiDrop && DOC_SIDEBAR.length > 0 && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 220,
                  background: NL.surface, border: `1px solid ${NL.borderMid}`,
                  borderRadius: 12, padding: 6,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 1001,
                }}>
                  <SidebarDropdown items={DOC_SIDEBAR} onClose={() => setWikiDrop(false)} />
                </div>
              )}
            </div>

            <button onClick={() => navigate("/lookup")} style={{ ...btnReset, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; }}
            >
              <FaSearch size={12} /> Lookup
            </button>

            <button onClick={() => navigate("/feedback")} style={{ ...btnReset, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; }}
            >
              <FaBug size={12} /> Feedback
            </button>

            <button onClick={() => navigate("/api-docs")} style={{ ...btnReset, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; }}
            >
              <FaCode size={12} /> API
            </button>

            <button onClick={() => navigate("/slot")} style={{ ...btnReset, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; }}
            >
              <FaStar size={13} /> Featured Slot
            </button>

            {portalLink && (
              <button onClick={() => navigate(portalLink.path)} style={{ ...btnReset, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; }}
              >
                {portalLink.icon} {portalLink.label}
              </button>
            )}

            <a href="https://discord.gg/xvaNzE35Rs" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "#7289da", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#7289da"; e.currentTarget.style.background = "none"; }}
            >
              <FaDiscord size={14} /> Discord
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
              <button onClick={handleSignOut} style={{ ...btnReset, padding: "6px 10px", borderRadius: 7, fontSize: 12, color: NL.muted }}
                onMouseEnter={e => e.currentTarget.style.color = NL.secondary}
                onMouseLeave={e => e.currentTarget.style.color = NL.muted}
              >Sign out</button>
            ) : (
              <button onClick={() => navigate("/login")} style={{ ...btnReset, display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary, background: NL.elevated, border: `1px solid ${NL.border}` }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
                onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
              >Sign in</button>
            )}
          </nav>
        )}

        {isMobile && (
          <button onClick={() => setDrawerOpen(v => !v)} aria-label="Toggle menu"
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
          width: "78vw", maxWidth: 300,
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

            <button onClick={() => navigate("/lookup")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaSearch size={13} /> Lookup</button>

            <button onClick={() => navigate("/feedback")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaBug size={13} /> Feedback</button>

            <button onClick={() => navigate("/api-docs")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaCode size={13} /> API</button>

            <button onClick={() => navigate("/slot")} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            ><FaStar size={14} /> Featured Slot</button>

            {portalLink && (
              <button onClick={() => navigate(portalLink.path)} style={drawerBtn()}
                onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
              >{portalLink.icon} {portalLink.label}</button>
            )}

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
              <button onClick={handleSignOut} style={{ ...drawerBtn(NL.muted) }}>Sign out</button>
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