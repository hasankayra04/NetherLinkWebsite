import { useState } from "react";
import { FaDiscord, FaBars, FaTimes, FaInfoCircle, FaSignInAlt, FaTachometerAlt, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./js/Firebase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch {
      alert("Logout failed.");
    }
  };

  const btnClass =
    "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none gaming-nav-button flex items-center gap-2";

  const InfoButton = (
    <button
      onClick={() => { navigate("/info"); setMenuOpen(false); }}
      className={`${btnClass} bg-slate-800/50 backdrop-blur-xl hover:bg-slate-700/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20`}
    >
      <FaInfoCircle /> Info
    </button>
  );

  const LoggedOutButtons = (
    <>
      {InfoButton}
      <button
        onClick={() => { navigate("/login"); setMenuOpen(false); }}
        className={`${btnClass} bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold border-2 border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105`}
      >
        <FaSignInAlt /> Login
      </button>
    </>
  );

  const LoggedInButtons = (
    <>
      {InfoButton}
      <button
        onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
        className={`${btnClass} bg-slate-800/50 backdrop-blur-xl hover:bg-slate-700/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 hover: shadow-lg hover:shadow-cyan-500/20`}
      >
        <FaTachometerAlt /> Dashboard
      </button>
      <button
        onClick={() => { handleLogout(); setMenuOpen(false); }}
        className={`${btnClass} bg-slate-800/50 backdrop-blur-xl hover:bg-slate-700/50 text-red-400 border border-red-500/30 hover: border-red-500/50 hover:shadow-lg hover:shadow-red-500/20`}
      >
        <FaSignOutAlt /> Logout
      </button>
    </>
  );

  const discordButton = (
    <a
      href="https://discord.gg/xvaNzE35Rs"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="gaming-discord-btn bg-indigo-600 hover: bg-indigo-700 text-white rounded-xl p-3 transition-all duration-300 border border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
      aria-label="Join us on Discord"
      title="Join us on Discord"
    >
      <FaDiscord size={20} />
    </a>
  );

  return (
    <>
      <header className="bg-slate-950/95 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-50 shadow-2xl shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
              
              <div className="relative w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-xl shadow-cyan-500/50 group-hover:shadow-cyan-500/70 transition-all duration-300 border border-cyan-400/30">
                <span className="text-white font-black text-xl tracking-tighter">N</span>
              </div>
            </div>
            
            <h1 className="elegant-logo text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500">
              NetherLink
            </h1>
          </div>

          <nav className="hidden lg:flex items-center gap-3">
            {user ? LoggedInButtons : LoggedOutButtons}
            {discordButton}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all duration-300 p-2.5 rounded-xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-cyan-500/30 animate-slide-down shadow-2xl">
            <div className="flex flex-col p-5 space-y-3 max-w-md mx-auto">
              {user ? LoggedInButtons : LoggedOutButtons}
              <div className="pt-3 border-t border-cyan-500/20 flex justify-center">
                {discordButton}
              </div>
            </div>
          </nav>
        )}
      </header>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        
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
        
        /* Elegant logo with Orbitron font */
        .elegant-logo {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          letter-spacing: 0.5px;
          filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.5));
          transition: all 0.3s ease;
        }
        
        .elegant-logo:hover {
          filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.8));
          letter-spacing: 1px;
        }
        
        .gaming-nav-button {
          position: relative;
          overflow: hidden;
        }
        
        .gaming-nav-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.5s ease, height 0.5s ease;
        }
        
        .gaming-nav-button:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .gaming-discord-btn {
          position: relative;
          overflow: hidden;
        }
        
        .gaming-discord-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: 0.5s;
        }
        
        .gaming-discord-btn:hover::after {
          left: 100%;
        }
      `}</style>
    </>
  );
}