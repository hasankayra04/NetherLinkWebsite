import { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import { useAuth } from "../useAuth";
import { C, font, API, EditorTab } from "../components/SkinEditor";

export default function SkinEditorPage() {
  const { user, idToken } = useAuth();
  const location = useLocation();
  const [initialSkin, setInitialSkin] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const skinId = new URLSearchParams(location.search).get("skin");
    if (!skinId) return;
    setLoading(true);
    fetch(`${API}/api/skins/${skinId}`)
      .then(r => r.ok ? r.json() : null)
      .then(skin => { if (skin) setInitialSkin(skin); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [location.search]);

  const title = initialSkin ? `Editing: ${initialSkin.name}` : "Create skin";

  return (
    <Layout title={`${title} | Skin Workshop`} wrapperClassName="skin-editor-page">
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <a href="/skins"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: `1px solid rgba(255,255,255,0.09)`, background: "#191f2b", color: "#8d97aa", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, textDecoration: "none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Gallery
          </a>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#eaecf0", fontFamily: font }}>
            {loading ? "Loading…" : title}
          </h1>
        </div>

        {!loading && (
          <EditorTab
            user={user}
            idToken={idToken}
            initialSkin={initialSkin}
            onSaved={() => { window.location.href = "/skins"; }}
          />
        )}
      </div>
    </Layout>
  );
}
