import React, { useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import Layout from "@theme/Layout";
import Spinner from "../components/Spinner";
import { API_BASE } from "../lib/api";

export default function DashboardPage() {
  const history = useHistory();

  useEffect(() => {
    if (!auth) { history.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { history.replace("/login"); return; }
      try {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { history.replace("/login"); return; }
        const { roles } = await res.json();
        if (roles?.includes("admin")) history.replace("/admin");
        else if (roles?.includes("partner")) history.replace("/account?tab=partner");
        else history.replace("/account");
      } catch (_) { history.replace("/login"); }
    });
    return () => unsub();
  }, []);

  return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117" }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );
}
