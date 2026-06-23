import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";
import { Link } from "react-router-dom";
import { FaChartLine, FaFileInvoiceDollar, FaServer, FaHeart, FaUsers } from "react-icons/fa";

const NL = {
  bg: "#0d0f14",
  surface: "#13161e",
  elevated: "#191c25",
  subtle: "#1f2330",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.08)",
  accentBorder: "rgba(103,228,4,0.20)",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
  success: "#34d399",
  successDim: "rgba(52,211,153,0.10)",
  gold: "#f59e0b",
  goldDim: "rgba(245,158,11,0.08)",
  goldBorder: "rgba(245,158,11,0.22)",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";

async function apiFetch(path, options = {}) {
  const token = await fetchIdToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;
  throw Object.assign(new Error(data.message || res.statusText), { data, status: res.status });
}

function Spinner({ size = 16 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 01-12-12z" />
    </svg>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          borderRadius: 14, border: `1px solid ${t.type === "error" ? NL.dangerBorder : "rgba(52,211,153,0.25)"}`,
          background: NL.surface, minWidth: 240, maxWidth: 340, pointerEvents: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: t.type === "error" ? NL.danger : NL.success }} />
          <span style={{ fontSize: 13, color: NL.text, flex: 1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: NL.muted, cursor: "pointer", fontSize: 14, padding: 2 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function Check({ color, dim, border }) {
  return (
    <span style={{
      width: 16, height: 16, flexShrink: 0,
      background: dim, border: `1px solid ${border}`,
      borderRadius: 4, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 9, color,
    }}>✓</span>
  );
}

const PLANS = [
  {
    id: "standard",
    label: "Standard",
    price: "$15",
    perLabel: "per featured server / month",
    servers: 1,
    features: [
      "1 featured server in the app",
      "Rotating spot in the Partnered Servers list in-app",
      "Rotating feature on the MCCompanion website",
      "Partner dashboard with visit stats and invoices",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    price: "$50",
    perLabel: "per featured server / month",
    servers: 1,
    features: [
      "1 featured server in the app",
      "Hero placement on the connector page",
      "Rotating feature on the MCCompanion website",
      "Partner dashboard with visit stats and invoices",
    ],
  },
];

function PlanCard({ plan, user, activePlan, onSubscribe, checkoutLoading }) {
  const isPremium = plan.id === "premium";
  const accent = isPremium ? NL.gold : NL.accent;
  const dim = isPremium ? NL.goldDim : NL.accentDim;
  const brd = isPremium ? NL.goldBorder : NL.accentBorder;
  const isActive = activePlan === plan.id;
  const loading = checkoutLoading === plan.id;

  function handleClick() {
    if (!user) { window.location.href = "/login"; return; }
    onSubscribe(plan.id);
  }

  return (
    <motion.div
      style={{ flex: 1, minWidth: 280, maxWidth: 400 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut", delay: isPremium ? 0.2 : 0.1 }}
    >
      <div style={{
        background: NL.surface,
        border: `1.5px solid ${isActive ? NL.accentBorder : isPremium ? brd : NL.border}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        height: "100%", display: "flex", flexDirection: "column",
        boxShadow: isPremium ? `0 0 48px ${dim}` : "none",
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}99 0%, ${accent}22 60%, transparent 100%)` }} />

        {isPremium && !isActive && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: NL.goldDim, border: `1px solid ${NL.goldBorder}`,
            borderRadius: 4, padding: "3px 8px",
            fontSize: 9, fontWeight: 700, color: NL.gold,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Most popular</div>
        )}
        {isActive && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
            borderRadius: 4, padding: "3px 8px",
            fontSize: 9, fontWeight: 700, color: NL.accent,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Active</div>
        )}

        <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: accent }}>{plan.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: NL.text, letterSpacing: "-0.04em", lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: NL.muted, fontSize: 13 }}>/month</span>
            </div>
            <p style={{ color: NL.muted, fontSize: 11, marginTop: 4 }}>{plan.perLabel} · Cancel anytime</p>
          </div>

          <div style={{ marginBottom: 22, flex: 1 }}>
            {plan.features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "9px 0", borderBottom: `1px solid ${NL.border}`,
                color: NL.secondary, fontSize: 13, lineHeight: 1.5,
              }}>
                <Check color={accent} dim={dim} border={brd} />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={handleClick}
            disabled={loading || isActive}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px", borderRadius: 10,
              background: isActive ? NL.accentDim : isPremium ? NL.goldDim : NL.elevated,
              border: `1.5px solid ${isActive ? NL.accentBorder : isPremium ? brd : NL.borderMid}`,
              color: isActive ? NL.accent : NL.text,
              fontSize: 14, fontWeight: 600, cursor: isActive ? "default" : "pointer",
              fontFamily: font, transition: "border-color 0.2s, background 0.2s",
              opacity: loading ? 0.7 : 1,
              width: "100%",
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = brd; e.currentTarget.style.background = dim; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = isPremium ? brd : NL.borderMid; e.currentTarget.style.background = isActive ? NL.accentDim : isPremium ? NL.goldDim : NL.elevated; } }}
          >
            {loading ? <><Spinner size={14} /> Redirecting…</> : isActive ? "✓ Current plan" : user ? `Get ${plan.label} →` : "Sign in to subscribe →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ActivePlanBanner({ plan, onCancel, cancelling, multipleServers }) {
  const planInfo = PLANS.find(p => p.id === plan);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: NL.surface, border: `1.5px solid ${NL.accentBorder}`,
        borderRadius: 16, padding: "18px 22px", marginBottom: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${NL.accent}, #38bdb0)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: NL.text }}>Active Partner — {planInfo?.label ?? plan}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: mono, letterSpacing: "0.08em", textTransform: "uppercase", background: NL.accentDim, color: NL.accent, border: `1px solid ${NL.accentBorder}` }}>
              {planInfo?.price}/mo
            </span>
          </div>
          <p style={{ fontSize: 12, color: NL.secondary, margin: "2px 0 0" }}>
            Your servers are live in the app.{" "}
            <a href="/dashboard" style={{ color: NL.accent, textDecoration: "none", fontWeight: 600 }}>Open dashboard →</a>
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8, textDecoration: "none",
          background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
          color: NL.accent, fontSize: 13, fontWeight: 600,
        }}>Dashboard</a>
        <button
          onClick={onCancel}
          disabled={cancelling}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}`,
            color: NL.danger, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font,
            opacity: cancelling ? 0.6 : 1,
          }}
        >
          {cancelling ? <><Spinner size={12} /> Cancelling…</> : multipleServers ? "Manage subscriptions →" : "Cancel plan"}
        </button>
      </div>
    </motion.div>
  );
}

export default function PartnerProgramPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [plan, setPlan] = useState(null);
  const [servers, setServers] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { toasts, add: toast, remove: removeToast } = useToasts();

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const successParam = params.get("success") === "1";
  const cancelledParam = params.get("cancelled") === "1";

  const fetchPlan = useCallback(async () => {
    setPlanLoading(true);
    try {
      const [planData, serversData] = await Promise.all([
        apiFetch("/api/partner/plan"),
        apiFetch("/api/partner/servers").catch(() => ({ servers: [] })),
      ]);
      setPlan(planData.plan ?? null);
      setServers(serversData.servers ?? []);
    } catch {
      setPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) { setAuthReady(true); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setAuthReady(true);
      if (u) fetchPlan();
    });
    return () => unsub();
  }, [fetchPlan]);

  useEffect(() => {
    if (!authReady) return;
    if (successParam) {
      toast("Welcome to the Partner Program! Your plan is now active.", "success");
      window.history.replaceState({}, "", "/partner");
      const t = setTimeout(fetchPlan, 3000);
      return () => clearTimeout(t);
    }
    if (cancelledParam) {
      toast("Checkout cancelled. No charge was made.");
      window.history.replaceState({}, "", "/partner");
    }
  }, [authReady, successParam, cancelledParam]);

  async function handleSubscribe(planKey) {
    if (!user) { window.location.href = "/login"; return; }
    setCheckoutLoading(planKey);
    try {
      const data = await apiFetch("/api/partner/checkout", { method: "POST", body: JSON.stringify({ plan: planKey }) });
      window.location.href = data.url;
    } catch (err) {
      if (err.data?.error === "no_account") {
        toast("You need an MCCompanion account first — download the app and register.", "error");
      } else {
        toast(err.message || "Failed to start checkout", "error");
      }
      setCheckoutLoading(null);
    }
  }

  async function handleCancel() {
    if (servers.length > 1) {
      window.location.href = "/dashboard";
      return;
    }
    const serverId = servers[0]?.id;
    if (!serverId) {
      toast("No server found to cancel.", "error");
      return;
    }
    if (!window.confirm("Cancel your subscription? Access continues until the end of the current billing period.")) return;
    setCancelling(true);
    try {
      await apiFetch("/api/partner/cancel", { method: "POST", body: JSON.stringify({ serverId }) });
      toast("Subscription cancelled. You keep access until end of billing period.");
      fetchPlan();
    } catch (err) {
      toast(err.message || "Failed to cancel", "error");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Layout
      title="Partner Program"
      description="Server owners keep MCCompanion free for players. In return, reach thousands of console players on PlayStation, Xbox and Switch."
    >
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, padding: "72px 20px 100px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          <motion.div
            style={{ textAlign: "center", marginBottom: 64 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span style={{
              fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase",
              color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
              borderRadius: 4, padding: "4px 12px", display: "inline-block", marginBottom: 22,
            }}>Partner Program</span>

            <h1 style={{
              fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: NL.text,
              letterSpacing: "-0.035em", margin: "0 0 16px", lineHeight: 1.15,
            }}>
              You keep the app free.<br />
              <span style={{ color: NL.accent }}>Players come to you.</span>
            </h1>

            <p style={{ color: NL.secondary, fontSize: 15, maxWidth: 520, margin: "0 auto 14px", lineHeight: 1.75 }}>
              Console relay and resource pack support are completely free for every player.
              Server owners fund the infrastructure, and get real visibility in return.
            </p>
            <p style={{ color: NL.muted, fontSize: 13, margin: 0 }}>
              Other apps charge players just to connect. We don't. The people with the budget are the server owners, and they get real value back.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 64, justifyContent: "center" }}
          >
            {[
              { icon: <FaHeart size={16} />, title: "You support the app", body: "A small monthly fee from server owners covers infrastructure and development, keeping the app free for all players forever." },
              { icon: <FaUsers size={16} />, title: "Players play for free", body: "Console relay, resource pack support, player lookup, skin editor and more. All free. Other apps charge just to connect." },
              { icon: <FaServer size={16} />, title: "Your server gets found", body: "Featured placement across the app and website. Thousands of console players looking for a server see yours first." },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 220, maxWidth: 280,
                background: NL.surface, border: `1px solid ${NL.border}`,
                borderRadius: 16, padding: "22px 20px",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                  background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: NL.accent,
                }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NL.text, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.65 }}>{item.body}</div>
              </div>
            ))}
          </motion.div>

          {authReady && !planLoading && plan && (
            <ActivePlanBanner plan={plan} onCancel={handleCancel} cancelling={cancelling} multipleServers={servers.length > 1} />
          )}

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: NL.text, letterSpacing: "-0.025em", margin: "0 0 8px" }}>
              Pick your plan
            </h2>
            <p style={{ color: NL.secondary, fontSize: 14, margin: 0 }}>
              Slots are limited. Fewer partners means more visibility per server.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", alignItems: "stretch", marginBottom: 64 }}>
            {PLANS.map(p => (
              <PlanCard
                key={p.id}
                plan={p}
                user={user}
                activePlan={authReady && !planLoading ? plan : undefined}
                onSubscribe={handleSubscribe}
                checkoutLoading={checkoutLoading}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.3 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
              <div style={{ flex: 1, height: 1, background: NL.border }} />
              <span style={{
                fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase",
                color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                borderRadius: 4, padding: "4px 12px", whiteSpace: "nowrap",
              }}>Included with every plan</span>
              <div style={{ flex: 1, height: 1, background: NL.border }} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, color: NL.text, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Partner Dashboard</h2>
              <p style={{ color: NL.secondary, fontSize: 14, margin: 0 }}>See exactly what your partnership delivers.</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
              <div style={{ flex: 1, minWidth: 220, maxWidth: 280, background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, padding: "20px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 14, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaServer size={15} style={{ color: NL.accent }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: NL.text, marginBottom: 6 }}>Visit Statistics</div>
                <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                  Players who visited your server from the app, split by total, this week, and this month.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["Total", "1,950"], ["Week", "89"], ["Month", "702"]].map(([label, val]) => (
                    <div key={label} style={{ flex: 1, background: NL.elevated, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NL.accent }}>{val}</div>
                      <div style={{ fontSize: 10, color: NL.muted, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 220, maxWidth: 280, background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, padding: "20px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 14, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaChartLine size={15} style={{ color: NL.accent }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: NL.text, marginBottom: 6 }}>Visit Graph</div>
                <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                  View visits by day, week, month or all time to track trends and spot peak moments.
                </div>
                <svg viewBox="0 0 200 48" style={{ width: "100%", height: 48 }}>
                  <polyline points="0,38 28,32 56,36 84,20 112,28 140,14 168,22 200,18" fill="none" stroke={NL.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="0,38 28,32 56,36 84,20 112,28 140,14 168,22 200,18 200,48 0,48" fill={`${NL.accent}18`} stroke="none" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 220, maxWidth: 280, background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, padding: "20px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 14, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaFileInvoiceDollar size={15} style={{ color: NL.accent }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: NL.text, marginBottom: 6 }}>Invoice History</div>
                <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                  All your payments in one place. Download PDF invoices for every billing period.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["May 2026", "$15.00"], ["Apr 2026", "$15.00"]].map(([month, amount]) => (
                    <div key={month} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: NL.elevated, borderRadius: 8, padding: "7px 10px" }}>
                      <span style={{ fontSize: 12, color: NL.secondary }}>{month}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: NL.text }}>{amount}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 3, padding: "2px 5px" }}>PAID</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <p style={{ textAlign: "center", color: NL.muted, fontSize: 12, marginTop: 48, lineHeight: 1.6 }}>
            Questions? <a href="mailto:jens@mccompanion.net" style={{ color: NL.secondary, textDecoration: "underline", textUnderlineOffset: 3 }}>jens@mccompanion.net</a>
            {" · "}
            <Link to="/terms" style={{ color: NL.secondary, textDecoration: "underline", textUnderlineOffset: 3 }}>Terms of Service</Link>
          </p>

        </div>
      </div>
      <ToastContainer toasts={toasts} remove={removeToast} />
    </Layout>
  );
}
