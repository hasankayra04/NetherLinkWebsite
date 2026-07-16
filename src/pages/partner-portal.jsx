import React, { useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Spinner from "../components/Spinner";

export default function PartnerPortalPage() {
  const history = useHistory();
  useEffect(() => { history.replace("/account?tab=partner"); }, []);
  return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117" }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );
}
