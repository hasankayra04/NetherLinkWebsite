import { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../lib/api";

const API_URL = `${API_BASE}/api/featured-servers`;

export default function FeaturedServersCarousel() {
  const [servers, setServers] = useState([]);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.servers || [];
        setServers(list);
        if (list.length) setActive(Math.floor(Math.random() * list.length));
      })
      .catch(() => setServers([]));
  }, []);

  useEffect(() => {
    if (!servers.length || paused) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActive((a) => (a === servers.length - 1 ? 0 : a + 1));
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [servers.length, paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [servers.length, active]);

  const prev = () => {
    setDirection(-1);
    setActive((a) => (a === 0 ? servers.length - 1 : a - 1));
  };
  const next = () => {
    setDirection(1);
    setActive((a) => (a === servers.length - 1 ? 0 : a + 1));
  };

  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40, scale: 0.99 }),
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40, transition: { duration: 0.3 } }),
  };

  if (!servers.length) {
    return (
      <section className="w-full max-w-3xl mx-auto mb-12 px-2">
        <div
          className="rounded-2xl px-7 py-8 flex justify-center items-center min-h-[160px]"
          style={{
            background: "linear-gradient(180deg, rgba(26,34,46,0.88), rgba(23,30,40,0.86))",
            border: "1px solid rgba(103,228,4,0.06)",
            boxShadow: "0 6px 24px rgba(20,30,40,0.25)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="text-slate-500 font-semibold animate-pulse">Loading featured servers...</span>
        </div>
      </section>
    );
  }

  const current = servers[active] || {};

  return (
    <section className="w-full max-w-3xl mx-auto mb-12 px-2">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="rounded-2xl py-7 px-6 relative overflow-hidden min-h-[230px] flex flex-col items-center"
        style={{
          border: "1px solid rgba(103,228,4,0.08)",
          boxShadow: "0 8px 36px rgba(20,30,50,0.20)",
          backdropFilter: "blur(8px)",
        }}
        aria-roledescription="carousel"
      >
        {/* BLURRED BACKGROUND IMAGE (fills the card) */}
        {current.iconUrl && (
          <img
            src={current.iconUrl}
            alt="" /* decorative background - keep empty alt */
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(14px) saturate(1.05)",
              transform: "scale(1.08)",
              opacity: 0.42,
              zIndex: 0,
            }}
          />
        )}

        {/* DARKENING GRADIENT LAYER so text is always readable */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,12,18,0.55) 0%, rgba(8,12,18,0.65) 65%, rgba(6,8,12,0.8) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* LEFT ARROW */}
        <button
          onClick={prev}
          aria-label="Previous server"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full transition-colors text-slate-200"
          style={{
            background: "rgba(20,26,34,0.45)",
            border: "1px solid rgba(255,255,255,0.03)",
            backdropFilter: "blur(6px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(103,228,4,0.13)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(103,228,4,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(20,26,34,0.45)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <FaChevronLeft size={18} />
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={next}
          aria-label="Next server"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full transition-colors text-slate-200"
          style={{
            background: "rgba(20,26,34,0.45)",
            border: "1px solid rgba(255,255,255,0.03)",
            backdropFilter: "blur(6px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(103,228,4,0.13)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(103,228,4,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(20,26,34,0.45)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <FaChevronRight size={18} />
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center text-center px-6 w-full max-w-xl"
            style={{ zIndex: 2 }} /* content above background & gradient */
            role="group"
            aria-label={`Slide ${active + 1} of ${servers.length}`}
          >
            {/* SHARP ICON / THUMBNAIL */}
            {current.iconUrl ? (
              <img
                src={current.iconUrl}
                alt={`${current.name} icon`}
                className="w-20 h-20 rounded-xl mb-4 object-cover"
                style={{
                  border: "2px solid rgba(103,228,4,0.18)",
                  background: "rgba(103,228,4,0.04)",
                  boxShadow: "0 6px 18px rgba(103,228,4,0.06)",
                }}
                loading="lazy"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-xl mb-4 flex items-center justify-center text-slate-300"
                style={{
                  background: "linear-gradient(180deg, rgba(30,40,48,0.6), rgba(24,30,36,0.6))",
                  border: "1px solid rgba(255,255,255,0.02)",
                }}
              >
                🎮
              </div>
            )}

            {current.featured ? (
              <span style={{
                display: "inline-block", marginBottom: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#f59e0b", background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.30)",
                borderRadius: 4, padding: "3px 8px",
              }}>⭐ Featured</span>
            ) : (
              <span style={{
                display: "inline-block", marginBottom: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#67e404", background: "rgba(103,228,4,0.10)",
                border: "1px solid rgba(103,228,4,0.22)",
                borderRadius: 4, padding: "3px 8px",
              }}>Partner</span>
            )}
            <h3 className="text-xl font-extrabold mb-1" style={{ color: "#e7f6ff" }}>
              {current.name}
            </h3>

            <div style={{ color: "#67e404", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, userSelect: "all", fontSize: 13 }}>
              {current.address}:{current.port}
            </div>

            <p className="text-slate-300 text-sm mb-4 max-w-[68%]">
              {current.description}
            </p>

            <div className="flex gap-3 items-center">
              {current.websiteUrl && (
                <a
                  href={current.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all"
                  style={{
                    color: "#0d1a00",
                    background: "linear-gradient(180deg,#80f505,#67e404)",
                    boxShadow: "0 6px 24px rgba(103,228,4,0.22)",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  Visit website <FaExternalLinkAlt size={12} />
                </a>
              )}

              <button
                onClick={() => {
                  if (current.address && current.port) {
                    navigator.clipboard?.writeText(`${current.address}:${current.port}`);
                    alert("Server address copied to clipboard");
                  }
                }}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-transparent border border-slate-700 text-slate-200"
                style={{
                  background: "rgba(255,255,255,0.02)",
                }}
                aria-label="Copy server address"
              >
                Copy address
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* INDICATORS */}
        <div className="flex gap-2 justify-center mt-6" style={{ zIndex: 2 }}>
          {servers.map((_, i) => {
            const activeStyle =
              i === active
                ? {
                  width: "22px",
                  height: "8px",
                  background: "linear-gradient(90deg,#80f505,#67e404)",
                  boxShadow: "0 6px 18px rgba(103,228,4,0.18)",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                }
                : {
                  width: "8px",
                  height: "8px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                };

            return (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  setDirection(i > active ? 1 : -1);
                  setActive(i);
                }}
                style={activeStyle}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}