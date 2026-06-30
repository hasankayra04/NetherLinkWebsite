import React, { useEffect, useState } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import Layout from "@theme/Layout";
import PartnerPanel from "../components/PartnerPanel";

const NL = { bg: "#0d1117", surface: "#131820", secondary: "#8d97aa" };
const font = "'Inter', system-ui, sans-serif";

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

const API_BASE = "https://api.mccompanion.net";

export default function PartnerPortalPage() {
  const history = useHistory();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auth) { setChecking(false); history.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setChecking(false); history.replace("/login"); return; }
      try {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { history.replace("/login"); return; }
        const { roles } = await res.json();
        if (!roles?.includes("partner") && !roles?.includes("admin")) {
          history.replace("/partner");
          return;
        }
      } catch (_) { history.replace("/login"); return; }
      setChecking(false);
    });
    return () => unsub();
  }, []);

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
        <PartnerPanel />
      </div>
    </Layout>
  );
}
