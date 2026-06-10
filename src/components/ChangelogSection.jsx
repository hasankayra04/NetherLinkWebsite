import React, { useState } from "react";
import { useChangelog } from "../hooks/useChangelog";

const BADGE = {
  violet:  "bg-violet-500/15 text-violet-300 border-violet-500/25",
  blue:    "bg-blue-500/15 text-blue-300 border-blue-500/25",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  indigo:  "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
};

function IconExternal() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/4 bg-white/2 animate-pulse shrink-0">
      <div className="w-6 h-6 rounded-full bg-white/8 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/8 rounded w-3/4" />
        <div className="h-2.5 bg-white/5 rounded w-1/4" />
      </div>
      <div className="w-14 h-5 bg-white/5 rounded-full shrink-0" />
    </div>
  );
}

export default function ChangelogSection() {
  const { entries, loading } = useChangelog({ perRepo: 10, total: 30 });

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-300">Recent changes</span>
          {!loading && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-500">
              {entries.length}
            </span>
          )}
        </div>
        <a
          href="https://github.com/MCCORG"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
        >
          GitHub <IconExternal />
        </a>
      </div>

      <div className="overflow-y-auto max-h-[420px] pr-1 space-y-1.5
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-white/10
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : entries.map(entry => (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/4 bg-white/2 hover:bg-white/5 hover:border-white/8 transition-all group no-underline shrink-0"
            >
              {entry.avatar ? (
                <img
                  src={entry.avatar}
                  alt={entry.author}
                  className="w-6 h-6 rounded-full shrink-0 opacity-70 group-hover:opacity-100 transition"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 group-hover:text-white transition truncate leading-snug">
                  {entry.message}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  <span className="font-mono">{entry.sha}</span>
                  <span className="mx-1.5">·</span>
                  {fmtDate(entry.date)}
                </p>
              </div>

              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${BADGE[entry.repo.color]}`}>
                {entry.repo.label}
              </span>
            </a>
          ))
        }
      </div>
    </section>
  );
}