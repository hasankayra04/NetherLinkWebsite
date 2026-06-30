import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseClient";
import { fetchIdToken } from "./firebaseAuthHelpers";
import { API_BASE } from "./lib/api";

async function resolveRole(user) {
  if (!user) return "none";
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return "none";
    const { roles } = await res.json();
    if (roles?.includes("admin")) return "admin";
    if (roles?.includes("partner")) return "partner";
    if (roles?.includes("user")) return "user";
    return "none";
  } catch {
    return "none";
  }
}

export function useAuth() {
  const [user,     setUser]     = useState(null);
  const [role,     setRole]     = useState(null);
  const [checking, setChecking] = useState(true);
  const [idToken,  setIdToken]  = useState(null);

  useEffect(() => {
    if (!auth) { setChecking(false); setRole("none"); return; }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole("none");
        setIdToken(null);
        setChecking(false);
        return;
      }
      try {
        const [resolvedRole, token] = await Promise.all([
          resolveRole(u),
          fetchIdToken(),
        ]);
        setRole(resolvedRole);
        setIdToken(token);
      } catch {
        setRole("none");
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  const reset = useCallback(() => {
    setUser(null);
    setRole("none");
    setIdToken(null);
  }, []);

  return { user, role, checking, idToken, reset };
}