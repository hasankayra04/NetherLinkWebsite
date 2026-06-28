import { useState, useEffect, useCallback } from "react";
import { T } from "../lib/tokens";

const REGIONS = [
  { key: "EU", label: "Europe", flag: "🇪🇺", url: "https://api.mccompanion.net/api/bots?region=eu" },
  { key: "US", label: "United States", flag: "🇺🇸", url: "https://api.mccompanion.net/api/bots?region=us" },
];

function XboxIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.102 5.388C3.214 6.528 2.5 7.978 2.5 9.74c0 2.977 1.376 5.635 3.527 7.373C7.217 15.66 8.757 13.61 10.578 12c-1.828-2.01-4.238-5.17-6.476-6.612zm15.796 0C17.66 6.83 15.25 9.99 13.422 12c1.821 1.61 3.361 3.66 4.551 5.113A9.47 9.47 0 0 0 21.5 9.74c0-1.762-.714-3.212-1.602-4.352zM12 2C9.86 2 7.91 2.8 6.43 4.14 8.96 5.64 11.43 9.07 12 9.73c.57-.66 3.04-4.09 5.57-5.59C16.09 2.8 14.14 2 12 2zm0 11.06c-1.66 1.55-3.17 3.61-4.25 5.71A9.46 9.46 0 0 0 12 20.5c1.55 0 3.01-.37 4.25-1.02C15.17 17.37 13.66 15.31 12 13.76z" />
    </svg>
  );
}

function SpinIcon({ spinning }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      style={{ animation: spinning ? "botspin 0.7s linear infinite" : "none", display: "block" }}>
      <style>{`@keyframes botspin{to{transform:rotate(360deg)}}`}</style>
      <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FriendBar({ count, max = 2000 }) {
  const pct = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;
  const warn = pct >= 90;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>friends</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: warn ? T.yellow : T.text, fontFamily: "monospace" }}>
          {count.toLocaleString()}<span style={{ color: T.muted, fontWeight: 400 }}> / {max.toLocaleString()}</span>
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 3, background: T.raised, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: warn ? T.yellow : T.green, transition: "width 0.6s ease" }} />
      </div>
      {warn && <p style={{ fontSize: 10, color: T.yellow, margin: "4px 0 0", fontFamily: "monospace" }}>⚠ Almost full</p>}
    </div>
  );
}

function BotCard({ bot, index }) {
  return (
    <div style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(103,228,4,0.08)", border: "1px solid rgba(103,228,4,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: T.green, flexShrink: 0 }}>
          <XboxIcon />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bot.gamertag}</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>Bot {index + 1}</div>
        </div>
      </div>
      {typeof bot.friendCount === "number"
        ? <FriendBar count={bot.friendCount} max={bot.maxFriends ?? 2000} />
        : <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>Friend count unavailable</div>
      }
    </div>
  );
}

function RegionPanel({ region, bots, loading, error }) {
  const total = bots.reduce((s, b) => s + (b.friendCount ?? 0), 0);
  const max = bots.reduce((s, b) => s + (b.maxFriends ?? 2000), 0);
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;

  return (
    <div style={{ flex: 1, minWidth: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{region.flag}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{region.label}</div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "monospace", marginTop: 1 }}>{region.key}</div>
          </div>
        </div>
        {!loading && !error && bots.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: pct >= 90 ? T.yellow : T.green, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>capacity</div>
          </div>
        )}
      </div>
      <div style={{ padding: 12 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0", color: T.muted }}>
            <SpinIcon spinning /> <span style={{ fontSize: 12 }}>Loading…</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>⚠️</div>
            <div style={{ fontSize: 12, color: T.red }}>Unreachable</div>
          </div>
        ) : bots.length === 0 ? (
          <div style={{ fontSize: 12, color: T.muted, textAlign: "center", padding: "24px 0" }}>No bots configured</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bots.map((bot, i) => <BotCard key={bot.gamertag} bot={bot} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BotStatus() {
  const [data, setData] = useState({
    EU: { bots: [], loading: true, error: false },
    US: { bots: [], loading: true, error: false },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const results = await Promise.allSettled(
      REGIONS.map(async r => {
        const res = await fetch(r.url);
        if (!res.ok) throw new Error();
        const d = await res.json();
        return { key: r.key, bots: d.bots ?? [] };
      })
    );
    const next = { ...data };
    results.forEach((r, i) => {
      const key = REGIONS[i].key;
      next[key] = r.status === "fulfilled"
        ? { bots: r.value.bots, loading: false, error: false }
        : { bots: [], loading: false, error: true };
    });
    setData(next);
    setUpdated(new Date());
    if (isRefresh) setRefreshing(false);
  }, []);

  useEffect(() => { fetchAll(); const id = setInterval(fetchAll, 30_000); return () => clearInterval(id); }, [fetchAll]);

  const timeStr = updated ? updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : null;

  return (
    <div>
      {/* status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, display: "inline-block" }} />
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live</span>
          {timeStr && <span style={{ fontSize: 11, color: T.muted, opacity: 0.6 }}>· {timeStr}</span>}
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, padding: "5px 10px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 7, color: T.sub, fontFamily: "inherit", cursor: refreshing ? "not-allowed" : "pointer", opacity: refreshing ? 0.5 : 1 }}>
          <SpinIcon spinning={refreshing} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {REGIONS.map(r => (
          <RegionPanel key={r.key} region={r} bots={data[r.key].bots} loading={data[r.key].loading} error={data[r.key].error} />
        ))}
      </div>

      <p style={{ fontSize: 10, color: T.muted, marginTop: 10, textAlign: "right" }}>Auto-refreshes every 30 seconds · Max 2,000 friends per bot</p>
    </div>
  );
}
