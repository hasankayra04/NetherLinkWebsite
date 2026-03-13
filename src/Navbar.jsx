import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed w-full top-0 z-40 glass-tile-nav border-b border-white/20 shadow-md">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <span className="text-blue-600 font-bold text-2xl tracking-tight">NL</span>
          <span className="font-bold text-blue-900 text-lg hidden sm:block">NetherLink</span>
        </div>
        <nav className="hidden md:flex items-center gap-5">
          <button
            onClick={() => navigate("/info")}
            className="px-4 py-2 rounded-full text-blue-700 bg-white/30 hover:bg-white/60 border border-white/20 font-medium transition-all backdrop-blur-xl"
          >
            Info
          </button>
          <button
            onClick={() => navigate("/slot")}
            className="px-4 py-2 rounded-full text-indigo-800 bg-white/40 hover:bg-blue-100 border border-white/20 font-bold transition-all backdrop-blur-xl shadow"
          >
            Featured Server Slot
          </button>
          <a
            href="https://discord.gg/xvaNzE35Rs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-full font-semibold transition"
          >
            <FaDiscord className="mr-2" /> Discord
          </a>
        </nav>
        <button
          className="md:hidden p-2 rounded-full border border-white/30 text-blue-700 glass-tile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth="2.2">
            {!open ? <path d="M4 8h20M4 16h20" /> : <path d="M7 7L21 21M7 21L21 7" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden px-5 pt-2 pb-3 border-t border-white/20 glass-tile-nav">
          <button
            onClick={() => {
              navigate("/info");
              setOpen(false);
            }}
            className="block w-full mb-1 text-blue-700 bg-white/30 hover:bg-white/60 border border-white/20 rounded-full px-4 py-2 text-left font-medium backdrop-blur-xl transition"
          >
            Info
          </button>
          <button
            onClick={() => {
              navigate("/slot");
              setOpen(false);
            }}
            className="block w-full mb-1 text-indigo-900 bg-white/40 hover:bg-blue-100 border border-white/20 rounded-full px-4 py-2 text-left font-bold shadow transition"
          >
            Featured Server Slot
          </button>
          <a
            href="https://discord.gg/xvaNzE35Rs"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-full font-semibold text-left mt-1"
            onClick={() => setOpen(false)}
          >
            <FaDiscord className="inline-block mr-2" /> Discord
          </a>
        </div>
      )}
      <style jsx="true">{`
        .glass-tile-nav {
          background: linear-gradient(115deg,rgba(255,255,255,0.54),rgba(158,235,255,0.10) 100%);
          box-shadow: 0 4px 32px 0 rgba(50,100,255,0.07);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
      `}</style>
    </header>
  );
}