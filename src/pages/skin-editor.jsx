import { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { useLocation, useHistory } from "@docusaurus/router";
import { useAuth } from "../useAuth";
import { C, font, API, EditorTab } from "../components/SkinEditor";

export default function SkinEditorPage() {
  const { user, idToken } = useAuth();
  const location = useLocation();
  const history = useHistory();
  const [initialSkin, setInitialSkin] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const skinId = new URLSearchParams(location.search).get("skin");
    if (!skinId) return;
    setLoading(true);
    fetch(`${API}/api/skins/${skinId}`)
      .then(r => r.ok ? r.json() : null)
      .then(skin => { if (skin) setInitialSkin(skin); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location.search]);

  const title = initialSkin ? `Editing: ${initialSkin.name}` : "Create skin";

  return (
    <Layout title={`${title} | Skin Workshop`}>
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <button type="button" onClick={() => history.push("/skins")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: `1px solid rgba(255,255,255,0.11)`, background: "#191f2b", color: "#8d97aa", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              Back to gallery
            </button>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#eaecf0" }}>
              {loading ? "Loading…" : title}
            </h1>
          </div>

          {!loading && (
            <EditorTab
              user={user}
              idToken={idToken}
              initialSkin={initialSkin}
              onSaved={() => history.push("/skins")}
            />
          )}

        </div>
      </div>
    </Layout>
  );
}
