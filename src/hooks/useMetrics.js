import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

const ENDPOINTS = {
  EU: `${API_BASE}/api/metrics`,
  US: `${API_BASE}/api/metrics`,
};

async function fetchMetrics(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useRegionMetrics(region) {
  const [data, setData] = useState({ topServers: [], totalServers: 0, totalJoins: 0 });
  const [loading, setLoading] = useState(true);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchMetrics(ENDPOINTS[region])
      .then(d => setData({
        topServers: d.topServers || [],
        totalServers: d.totalServers || 0,
        totalJoins: d.totalCount || 0,
      }))
      .catch(() => setData({ topServers: [], totalServers: 0, totalJoins: 0 }))
      .finally(() => setLoading(false));
  }, [region, refetchIndex]);

  const refetch = () => setRefetchIndex(i => i + 1);

  return { ...data, loading, refetch };
}

export function useCombinedMetrics() {
  const [totals, setTotals] = useState({ totalServers: 0, totalJoins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMetrics(ENDPOINTS.EU).catch(() => null),
      fetchMetrics(ENDPOINTS.US).catch(() => null),
    ]).then(([eu, us]) => {
      setTotals({
        totalServers: (eu?.totalServers || 0) + (us?.totalServers || 0),
        totalJoins: (eu?.totalCount || 0) + (us?.totalCount || 0),
      });
    }).finally(() => setLoading(false));
  }, []);

  return { ...totals, loading };
}