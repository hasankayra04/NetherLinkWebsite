import { useState } from "react";
import { FaDiscord, FaBars, FaTimes, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const btnClass =
    "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none flex items-center gap-2";

  const InfoButton = (
    <button
      onClick={() => { navigate("/info"); setMenuOpen(false); }}
      className={`${btnClass} bg-neutral-800/50 backdrop-blur-xl hover:bg-neutral-700/50 text-gray-300 border border-gray-400/30 hover:border-gray-400/50 hover:shadow-lg hover:shadow-gray-400/20`}
    >
      <FaInfoCircle /> Info
    </button>
  );

  const discordButton = (
    <a
      href="https://discord.gg/xvaNzE35Rs"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-3 transition-all duration-300 border border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
      aria-label="Join us on Discord"
      title="Join us on Discord"
    >
      <FaDiscord size={20} />
    </a>
  );

  return (
    <>
      <header className="bg-neutral-950/95 backdrop-blur-xl border-b border-gray-400/30 sticky top-0 z-50 shadow-2xl shadow-gray-400/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
              
              <div className="relative w-11 h-11 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-xl shadow-gray-400/50 group-hover:shadow-gray-400/70 transition-all duration-300 border border-gray-400/30">
                <span className="text-white font-black text-xl tracking-tighter">N</span>
              </div>
            </div>
            
            <h1 className="elegant-logo text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
              NetherLink
            </h1>
          </div>

          <nav className="hidden lg:flex items-center gap-3">
            {discordButton}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-gray-400 hover:text-gray-300 focus:outline-none transition-all duration-300 p-2.5 rounded-xl hover:bg-gray-400/10 border border-transparent hover:border-gray-400/30"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="lg:hidden bg-neutral-900/95 backdrop-blur-xl border-t border-gray-400/30 animate-slide-down shadow-2xl">
            <div className="flex flex-col p-5 space-y-3 max-w-md mx-auto">
              <div className="pt-3 border-t border-gray-400/20 flex justify-center">
                {discordButton}
              </div>
            </div>
          </nav>
        )}
      </header>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .elegant-logo {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          letter-spacing: 0.5px;
          filter: drop-shadow(0 0 10px rgba(156, 163, 175, 0.5));
          transition: all 0.3s ease;
        }
        
        .elegant-logo:hover {
          filter: drop-shadow(0 0 20px rgba(156, 163, 175, 0.8));
          letter-spacing: 1px;
        }
      `}</style>
    </>
  );
}