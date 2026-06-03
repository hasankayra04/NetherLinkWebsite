import { motion } from "framer-motion";
import { FaDiscord, FaChartLine, FaFileInvoiceDollar, FaServer } from "react-icons/fa";
import { Link } from "react-router-dom";
import Layout from "@theme/Layout";

const NL = {
  bg: "#111318",
  surface: "#191c23",
  elevated: "#1f232c",
  subtle: "#252931",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.12)",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  teal: "#67e404",
  tealDim: "rgba(103,228,4,0.10)",
  tealBorder: "rgba(103,228,4,0.22)",
  gold: "#f59e0b",
  goldDim: "rgba(245,158,11,0.10)",
  goldBorder: "rgba(245,158,11,0.28)",
};

function Check({ accent, dim, border }) {
  return (
    <span style={{
      width: 16, height: 16, flexShrink: 0,
      background: dim, border: `1px solid ${border}`,
      borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, color: accent,
    }}>✓</span>
  );
}

function FeatureLine({ accent, dim, border, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 0",
      borderBottom: `1px solid ${NL.border}`,
      color: NL.secondary, fontSize: 13,
    }}>
      <Check accent={accent} dim={dim} border={border} />
      {children}
    </div>
  );
}

function PlanCard({ plan, delay }) {
  const isPremium = plan.id === "premium";
  const accent = isPremium ? NL.gold : NL.teal;
  const dim = isPremium ? NL.goldDim : NL.tealDim;
  const brd = isPremium ? NL.goldBorder : NL.tealBorder;

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
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        height: "100%",
        display: "flex", flexDirection: "column",
        boxShadow: isPremium ? `0 0 40px rgba(245,158,11,0.08)` : "none",
      }}>
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, ${accent}88 0%, ${accent}22 60%, transparent 100%)`,
        }} />

        {isPremium && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: NL.goldDim,
            border: `1px solid ${NL.goldBorder}`,
            borderRadius: 4, padding: "3px 8px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, fontWeight: 700,
            color: NL.gold, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Most Popular</div>
        )}

        <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", flex: 1 }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase",
                color: accent,
              }}>{plan.label}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: "0.06em",
                color: accent, background: dim,
                border: `1px solid ${brd}`,
                borderRadius: 4, padding: "2px 7px",
              }}>max {plan.slots} slots</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 40, fontWeight: 700, color: NL.text,
                letterSpacing: "-0.04em", lineHeight: 1,
              }}>{plan.price}</span>
              <span style={{ color: NL.muted, fontSize: 14, fontWeight: 500 }}>/ month</span>
            </div>
            <p style={{ color: NL.muted, fontSize: 11, marginTop: 6, letterSpacing: "0.01em" }}>
              Billed monthly · Cancel anytime
            </p>
          </div>

          <div style={{ marginBottom: 22, flex: 1 }}>
            {plan.features.map((f, i) => (
              <FeatureLine key={i} accent={accent} dim={dim} border={brd}>{f}</FeatureLine>
            ))}
          </div>

          <p style={{ fontSize: 13, color: NL.secondary, marginBottom: 10, lineHeight: 1.5 }}>
            Contact <strong style={{ color: NL.text, fontWeight: 600 }}>Jens.Co</strong> on Discord:
          </p>
          <a
            href="https://discord.gg/xvaNzE35Rs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px",
              background: isPremium ? NL.goldDim : NL.elevated,
              border: `1px solid ${isPremium ? brd : NL.borderMid}`,
              borderRadius: 10, color: NL.text,
              textDecoration: "none", fontSize: 14, fontWeight: 600,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = brd;
              e.currentTarget.style.background = dim;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = isPremium ? brd : NL.borderMid;
              e.currentTarget.style.background = isPremium ? NL.goldDim : NL.elevated;
            }}
          >
            <FaDiscord size={16} style={{ color: "#7289da" }} />
            Get {plan.label}
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
      "Rotating spot in the Partnered Servers list in the app",
      "Rotating feature on the MCCompanion website",
      "Rotating Discord Server of the Day",
      "Cancel anytime · Full refund guarantee",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    price: "$50",
    slots: 15,
    features: [
      "Everything in Standard",
      "Rotating hero feature in the app — first thing every user sees on launch",
      "Limited to 15 slots for maximum visibility",
      "Cancel anytime · Full refund guarantee",
    ],
  },
];

export default function FeaturedSlot() {
  return (
    <Layout>
      <div style={{
        minHeight: "100vh", background: NL.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "72px 20px 80px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        <motion.div
          style={{ textAlign: "center", marginBottom: 48 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
        >
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase",
            color: NL.teal, background: NL.tealDim,
            border: `1px solid ${NL.tealBorder}`,
            borderRadius: 4, padding: "4px 12px",
            display: "inline-block", marginBottom: 18,
          }}>Featured Slots</span>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: NL.text,
            letterSpacing: "-0.025em", margin: "0 0 12px", lineHeight: 1.2,
          }}>Showcase your server</h1>
          <p style={{ color: NL.secondary, fontSize: 15, margin: "0 0 10px", maxWidth: 480 }}>
            Put your server in front of thousands of console players on PlayStation, Xbox, and Nintendo Switch.
          </p>
          <p style={{ color: NL.muted, fontSize: 13, margin: 0, maxWidth: 480 }}>
            All slots work on a <span style={{ color: NL.secondary, fontWeight: 500 }}>rotating basis</span> — your server cycles through every featured placement across the app, website, and Discord equally.
          </p>
        </motion.div>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: 20,
          width: "100%", maxWidth: 860,
          justifyContent: "center", alignItems: "stretch",
        }}>
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} delay={0.1 + i * 0.1} />
          ))}
        </div>

        <motion.div
          style={{ width: "100%", maxWidth: 860, marginTop: 56 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.3 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div style={{ flex: 1, height: 1, background: NL.border }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase",
              color: NL.teal, background: NL.tealDim,
              border: `1px solid ${NL.tealBorder}`,
              borderRadius: 4, padding: "4px 12px", whiteSpace: "nowrap",
            }}>Included with every plan</span>
            <div style={{ flex: 1, height: 1, background: NL.border }} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{
              fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: NL.text,
              letterSpacing: "-0.02em", margin: "0 0 10px",
            }}>Partner Dashboard</h2>
            <p style={{ color: NL.secondary, fontSize: 14, margin: 0 }}>
              Every partner gets access to a private dashboard to track their server's performance.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>

            <div style={{
              flex: 1, minWidth: 220, maxWidth: 280,
              background: NL.surface, border: `1px solid ${NL.border}`,
              borderRadius: 16, padding: "20px 20px 18px",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                background: NL.tealDim, border: `1px solid ${NL.tealBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FaServer size={15} style={{ color: NL.teal }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: NL.text, marginBottom: 6 }}>Visit Statistics</div>
              <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                See exactly how many players visited your server — total, this week, and this month.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Total", "1,950"], ["Week", "89"], ["Month", "702"]].map(([label, val]) => (
                  <div key={label} style={{
                    flex: 1, background: NL.elevated, borderRadius: 8,
                    padding: "8px 6px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: NL.teal }}>{val}</div>
                    <div style={{ fontSize: 10, color: NL.muted, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              flex: 1, minWidth: 220, maxWidth: 280,
              background: NL.surface, border: `1px solid ${NL.border}`,
              borderRadius: 16, padding: "20px 20px 18px",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                background: NL.tealDim, border: `1px solid ${NL.tealBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FaChartLine size={15} style={{ color: NL.teal }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: NL.text, marginBottom: 6 }}>Weekly Graph</div>
              <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                A daily visit graph over the past two weeks so you can spot trends and peak days.
              </div>
              <svg viewBox="0 0 200 48" style={{ width: "100%", height: 48 }}>
                <polyline
                  points="0,38 28,32 56,36 84,20 112,28 140,14 168,22 200,18"
                  fill="none" stroke={NL.teal} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points="0,38 28,32 56,36 84,20 112,28 140,14 168,22 200,18 200,48 0,48"
                  fill={`${NL.teal}18`} stroke="none"
                />
              </svg>
            </div>

            <div style={{
              flex: 1, minWidth: 220, maxWidth: 280,
              background: NL.surface, border: `1px solid ${NL.border}`,
              borderRadius: 16, padding: "20px 20px 18px",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                background: NL.tealDim, border: `1px solid ${NL.tealBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FaFileInvoiceDollar size={15} style={{ color: NL.teal }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: NL.text, marginBottom: 6 }}>Invoice History</div>
              <div style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                All your purchases in one place. Download PDF invoices for every billing period.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["May 2026", "$15.00"], ["Apr 2026", "$15.00"]].map(([month, amount]) => (
                  <div key={month} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: NL.elevated, borderRadius: 8, padding: "7px 10px",
                  }}>
                    <span style={{ fontSize: 12, color: NL.secondary }}>{month}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: NL.text }}>{amount}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                        color: "#4ade80", background: "rgba(74,222,128,0.12)",
                        border: "1px solid rgba(74,222,128,0.25)",
                        borderRadius: 3, padding: "2px 5px",
                      }}>PAID</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        <motion.p
          style={{ textAlign: "center", color: NL.muted, fontSize: 12, marginTop: 40, lineHeight: 1.5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your slot helps keep MCCompanion running for all players.{" "}
          <Link to="/terms" style={{ color: NL.secondary, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Terms of Service
          </Link>
        </motion.p>

      </div>
    </Layout>
  );
}
