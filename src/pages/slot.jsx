import { motion } from "framer-motion";
import { FaDiscord, FaChartLine, FaFileInvoiceDollar, FaServer, FaHeart, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import Layout from "@theme/Layout";

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
  gold: "#f59e0b",
  goldDim: "rgba(245,158,11,0.08)",
  goldBorder: "rgba(245,158,11,0.22)",
};

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

function PlanCard({ plan, delay }) {
  const isPremium = plan.id === "premium";
  const accent = isPremium ? NL.gold : NL.accent;
  const dim = isPremium ? NL.goldDim : NL.accentDim;
  const brd = isPremium ? NL.goldBorder : NL.accentBorder;

  return (
    <motion.div
      style={{ flex: 1, minWidth: 280, maxWidth: 400 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut", delay }}
    >
      <div style={{
        background: NL.surface,
        border: `1px solid ${isPremium ? brd : NL.border}`,
        borderRadius: 20, overflow: "hidden", position: "relative",
        height: "100%", display: "flex", flexDirection: "column",
        boxShadow: isPremium ? `0 0 48px ${dim}` : "none",
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}99 0%, ${accent}22 60%, transparent 100%)` }} />

        {isPremium && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: NL.goldDim, border: `1px solid ${NL.goldBorder}`,
            borderRadius: 4, padding: "3px 8px",
            fontSize: 9, fontWeight: 700, color: NL.gold,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Most popular</div>
        )}

        <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: accent }}>{plan.label}</span>
              <span style={{
                fontSize: 9, letterSpacing: "0.06em", color: accent,
                background: dim, border: `1px solid ${brd}`,
                borderRadius: 4, padding: "2px 7px",
              }}>max {plan.slots} partners</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: NL.text, letterSpacing: "-0.04em", lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: NL.muted, fontSize: 14 }}>/month</span>
            </div>
            <p style={{ color: NL.muted, fontSize: 11, marginTop: 6 }}>Billed monthly · Cancel anytime</p>
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

          <p style={{ fontSize: 13, color: NL.secondary, marginBottom: 10 }}>
            Contact <strong style={{ color: NL.text }}>Jens.Co</strong> on Discord to get started:
          </p>
          <a
            href="https://discord.gg/xvaNzE35Rs"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px", borderRadius: 10, textDecoration: "none",
              background: isPremium ? NL.goldDim : NL.elevated,
              border: `1px solid ${isPremium ? brd : NL.borderMid}`,
              color: NL.text, fontSize: 14, fontWeight: 600,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = brd; e.currentTarget.style.background = dim; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isPremium ? brd : NL.borderMid; e.currentTarget.style.background = isPremium ? NL.goldDim : NL.elevated; }}
          >
            <FaDiscord size={16} style={{ color: "#7289da" }} />
            Become a partner
          </a>
        </div>
      </div>
    </motion.div>
  );
}

const PLANS = [
  {
    id: "standard",
    label: "Standard",
    price: "$15",
    slots: 30,
    features: [
      "Rotating spot in the Partnered Servers list in-app",
      "Rotating feature on the MCCompanion website",
      "Rotating Discord Server of the Day",
      "Partner dashboard with visit stats and invoices",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    price: "$50",
    slots: 15,
    features: [
      "Everything in Standard",
      "Hero placement on the connector page, first thing every player sees",
      "Limited to 15 partners for maximum visibility",
      "Priority support from the MCCompanion team",
    ],
  },
];

export default function FeaturedSlot() {
  return (
    <Layout title="Partner Program" description="Server owners keep MCCompanion free for players. In return, reach thousands of console players on PlayStation, Xbox and Switch.">
      <div style={{
        minHeight: "100vh", background: NL.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "72px 20px 100px",
      }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          {/* Hero */}
          <motion.div
            style={{ textAlign: "center", marginBottom: 64 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span style={{
              fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase",
              color: NL.accent, background: NL.accentDim,
              border: `1px solid ${NL.accentBorder}`,
              borderRadius: 4, padding: "4px 12px",
              display: "inline-block", marginBottom: 22,
            }}>Partner Program</span>

            <h1 style={{
              fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: NL.text,
              letterSpacing: "-0.035em", margin: "0 0 16px", lineHeight: 1.15,
            }}>
              You keep the app free.<br />
              <span style={{ color: NL.accent }}>Players come to you.</span>
            </h1>

            <p style={{ color: NL.secondary, fontSize: 15, maxWidth: 520, margin: "0 auto 14px", lineHeight: 1.75 }}>
              Console relay, player lookup, skin editor and more are completely free.
              Console relay and resource pack support are completely free for every player.
              Server owners fund the infrastructure, and get real visibility in return.
            </p>
            <p style={{ color: NL.muted, fontSize: 13, margin: 0 }}>
              Other apps charge players just to connect. We don't. The people with the budget are the server owners, and they get real value back.
            </p>
          </motion.div>

          {/* How it works — 3 points */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 64, justifyContent: "center" }}
          >
            {[
              { icon: <FaHeart size={16} />, title: "You support the app", body: "A small monthly fee from server owners covers infrastructure, development, and keeps the app free for all players forever." },
              { icon: <FaUsers size={16} />, title: "Players play for free", body: "Console relay, resource pack support, player lookup, skin editor and more. All free. Other apps charge just to connect." },
              { icon: <FaServer size={16} />, title: "Your server gets found", body: "Featured placement across the app, website, and Discord. Thousands of console players looking for a server see yours first." },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 220, maxWidth: 280,
                background: NL.surface, border: `1px solid ${NL.border}`,
                borderRadius: 16, padding: "22px 20px",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                  background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: NL.accent,
                }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NL.text, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.65 }}>{item.body}</div>
              </div>
            ))}
          </motion.div>

          {/* Pricing */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: NL.text, letterSpacing: "-0.025em", margin: "0 0 8px" }}>
              Pick your plan
            </h2>
            <p style={{ color: NL.secondary, fontSize: 14, margin: 0 }}>
              Slots are limited. Fewer partners means more visibility per server.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", alignItems: "stretch", marginBottom: 64 }}>
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} delay={0.1 + i * 0.1} />
            ))}
          </div>

          {/* Dashboard section */}
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
              <p style={{ color: NL.secondary, fontSize: 14, margin: 0 }}>
                See exactly what your partnership delivers.
              </p>
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
            Questions? Reach out on Discord.{" "}
            <Link to="/terms" style={{ color: NL.secondary, textDecoration: "underline", textUnderlineOffset: 3 }}>Terms of Service</Link>
          </p>

        </div>
      </div>
    </Layout>
  );
}
