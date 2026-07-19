import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T } from "../lib/tokens";

const NL = {
    ...T,
    elevated: T.raised,
    secondary: T.sub,
    accent: T.green,
    accentDim: "rgba(103,228,4,0.10)",
    accentBorder: "rgba(103,228,4,0.22)",
};

const STEPS = [
    {
        id: 0,
        image: "/img/landing.png",
        title: "Your hub",
        desc: "Featured servers and quick access to every feature, all on one screen.",
        accent: "#67e404",
    },
    {
        id: 1,
        image: "/img/connector.png",
        title: "Console Connect",
        desc: "Xbox, PlayStation or Switch: pick a server, tap Start. It shows up on your console in seconds.",
        accent: "#60a5fa",
    },
    {
        id: 2,
        image: "/img/skins.png",
        title: "Skins & Editor",
        desc: "Browse recent Bedrock skins, view your own Java & Bedrock skin, or build one from scratch.",
        accent: "#a78bfa",
    },
    {
        id: 3,
        image: "/img/editor.png",
        title: "Skin Editor",
        desc: "Create and customise skins pixel by pixel with a full-featured built-in editor.",
        accent: "#e879f9",
    },
    {
        id: 4,
        image: "/img/friends.png",
        title: "Friends & Social",
        desc: "See who's online, send friend requests and chat, all inside the app.",
        accent: "#fb923c",
    },
    {
        id: 5,
        image: "/img/lookup.png",
        title: "Player Lookup",
        desc: "Search any Minecraft player and see their skin, UUID, name history and more.",
        accent: "#34d399",
    },
    {
        id: 6,
        image: "/img/profile.png",
        title: "Your Profile",
        desc: "Manage your accounts, linked consoles, and app settings all in one place.",
        accent: "#f59e0b",
    },
];

const PHONE_W = 300;
const PHONE_H = 600;

function PhoneMockup({ src, accent }) {
    return (
        <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, flexShrink: 0 }}>
            <div style={{
                position: "absolute", inset: 0,
                borderRadius: 44,
                border: `2px solid ${accent}55`,
                background: "#08090c",
                overflow: "hidden",
                boxShadow: `0 0 0 1px ${accent}20, 0 32px 80px rgba(0,0,0,0.7)`,
            }}>
                {/* Notch */}
                <div style={{
                    position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
                    width: 88, height: 26, background: "#08090c", borderRadius: 13, zIndex: 10,
                }} />
                {/* Screen */}
                <div style={{
                    position: "absolute", top: 3, left: 3, right: 3, bottom: 3,
                    borderRadius: 42, overflow: "hidden", background: "#0d1117",
                }}>
                    <img src={src} alt="" style={{
                        width: "100%", height: "100%",
                        objectFit: "contain", objectPosition: "center center", display: "block",
                    }} />
                </div>
                {/* Glare */}
                <div style={{
                    position: "absolute", inset: 3, borderRadius: 42,
                    background: "linear-gradient(140deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
                    pointerEvents: "none", zIndex: 5,
                }} />
            </div>
            {/* Side buttons */}
            <div style={{ position: "absolute", right: -3, top: 130, width: 4, height: 48, borderRadius: "0 3px 3px 0", background: "rgba(255,255,255,0.11)" }} />
            {[96, 142].map(t => (
                <div key={t} style={{ position: "absolute", left: -3, top: t, width: 4, height: 36, borderRadius: "3px 0 0 3px", background: "rgba(255,255,255,0.11)" }} />
            ))}
        </div>
    );
}

export default function AppShowcase() {
    const [active, setActive] = useState(0);
    const [dir, setDir] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 780);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    function startTimer() {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setDir(1);
            setActive(a => (a + 1) % STEPS.length);
        }, 3600);
    }

    useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

    function goTo(idx) {
        if (idx === active) return;
        setDir(idx > active ? 1 : -1);
        setActive(idx);
        startTimer();
    }

    const step = STEPS[active];

    const phoneScale = isMobile ? Math.min(1, (typeof window !== "undefined" ? (window.innerWidth * 0.75) : 300) / PHONE_W) : 1;

    const phoneNode = (
        <div style={{
            position: "relative", flexShrink: 0,
            width: PHONE_W, height: PHONE_H,
            transform: `scale(${phoneScale})`,
            transformOrigin: "top center",
        }}>
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: PHONE_W + 120, height: PHONE_H + 120,
                borderRadius: "50%",
                background: `radial-gradient(ellipse at center, ${step.accent}28 0%, transparent 65%)`,
                transition: "background 0.6s ease",
                pointerEvents: "none",
            }} />
            <AnimatePresence mode="sync">
                <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ position: "absolute", inset: 0 }}
                >
                    <PhoneMockup src={step.image} accent={step.accent} />
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const stepsNode = (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 260, maxWidth: 360 }}>

            {STEPS.map((s, i) => {
                const isActive = i === active;
                return (
                    <button
                        key={s.id}
                        onClick={() => goTo(i)}
                        style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "11px 14px", borderRadius: 12,
                            background: isActive ? NL.elevated : "transparent",
                            border: `1px solid ${isActive ? s.accent + "33" : "transparent"}`,
                            cursor: "pointer", textAlign: "left",
                            transition: "background 0.22s, border-color 0.22s",
                            fontFamily: "'Inter', system-ui, sans-serif",
                            outline: "none",
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = NL.surface; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                        <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: isActive ? s.accent + "20" : NL.elevated,
                            border: `1px solid ${isActive ? s.accent + "44" : NL.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.22s",
                        }}>
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 11, fontWeight: 700,
                                color: isActive ? s.accent : NL.muted,
                                transition: "color 0.22s",
                            }}>0{i + 1}</span>
                        </div>

                        <span style={{
                            fontSize: 14, fontWeight: 600,
                            color: isActive ? NL.text : NL.secondary,
                            transition: "color 0.22s",
                        }}>{s.title}</span>
                    </button>
                );
            })}

            <div style={{
                position: "relative",
                marginTop: 4,
                padding: "14px 16px",
                borderRadius: 12,
                background: NL.elevated,
                border: `1px solid ${step.accent}22`,
                height: 68,
                overflow: "hidden",
                transition: "border-color 0.4s ease",
                flexShrink: 0,
            }}>
                <AnimatePresence mode="sync">
                    <motion.p
                        key={active}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: "absolute", inset: "14px 16px",
                            fontSize: 13, color: NL.secondary, lineHeight: 1.65,
                            margin: 0,
                        }}
                    >{step.desc}</motion.p>
                </AnimatePresence>
            </div>

            <div style={{ display: "flex", gap: 6, padding: "6px 2px 0" }}>
                {STEPS.map((s, i) => (
                    <button key={i} onClick={() => goTo(i)} style={{
                        width: i === active ? 24 : 7, height: 7, borderRadius: 4,
                        background: i === active ? step.accent : NL.elevated,
                        border: "none", cursor: "pointer", padding: 0,
                        transition: "width 0.3s, background 0.3s",
                    }} />
                ))}
            </div>
        </div>
    );

    return (
        <section style={{
            width: "100%", boxSizing: "border-box",
            background: "transparent",
            padding: "64px 24px 72px",
            display: "flex", flexDirection: "column", alignItems: "center",
            fontFamily: "'Inter', system-ui, sans-serif",
            position: "relative", overflow: "hidden",
        }}>

            <div style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}>
                <span style={{
                    display: "inline-block",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase",
                    color: NL.accent, background: NL.accentDim,
                    border: `1px solid ${NL.accentBorder}`,
                    borderRadius: 4, padding: "4px 12px", marginBottom: 18,
                }}>The app</span>
                <h2 style={{
                    fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: NL.text,
                    letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.2,
                }}>
                    Everything you need, in your pocket
                </h2>
                <p style={{ fontSize: 15, color: NL.secondary, margin: 0 }}>
                    From splash to server in under 10 seconds.
                </p>
            </div>

            <div style={{ width: "100%", maxWidth: 960, position: "relative", zIndex: 1 }}>
                {isMobile ? (
                    // Mobile: phone centered and scaled, steps below.
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
                        <div style={{
                            width: PHONE_W,
                            height: PHONE_H * phoneScale,
                            position: "relative",
                        }}>
                            {phoneNode}
                        </div>
                        <div style={{ width: "100%", maxWidth: 420, padding: "0 8px", boxSizing: "border-box" }}>
                            {stepsNode}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "row", gap: 72, alignItems: "center", justifyContent: "center" }}>
                        <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, flexShrink: 0 }}>
                            {phoneNode}
                        </div>
                        {stepsNode}
                    </div>
                )}
            </div>
        </section>
    );
}
