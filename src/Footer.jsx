import { Link } from "react-router-dom";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-neutral-950 to-neutral-900 text-gray-400 py-12 mt-16 border-t border-gray-400/30 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-6 group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                
                <div className="relative w-10 h-10 bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 rounded-xl flex items-center justify-center shadow-xl shadow-gray-400/50 border-2 border-gray-400/50 group-hover:scale-105 transition-all duration-300">
                  <div className="text-white font-black text-xl leading-none">N</div>
                </div>
              </div>
              
              <span className="elegant-logo text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
                NetherLink
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4 mb-8">
            <a 
              href="https://discord.gg/xvaNzE35Rs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative"
            >
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-neutral-800/50 backdrop-blur-xl hover:bg-neutral-700/50 p-3 rounded-xl border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-300 hover:scale-110">
                <FaDiscord className="w-5 h-5 text-indigo-400" />
              </div>
            </a>
            
            <a 
              href="https://github.com/NetherDevMc/NetherLinkWebsite" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative"
            >
              <div className="absolute inset-0 bg-gray-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-neutral-800/50 backdrop-blur-xl hover:bg-neutral-700/50 p-3 rounded-xl border border-gray-400/30 hover:border-gray-400/50 transition-all duration-300 hover:scale-110">
                <FaGithub className="w-5 h-5 text-gray-400" />
              </div>
            </a>
          </div>
          
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-8 shadow-lg shadow-gray-400/50"></div>
          
          <nav className="flex flex-wrap justify-center gap-6 mb-8">
            {[
              { to: "/info", label: "Info" },
              { to: "/privacy", label: "Privacy" },
              { to: "/terms", label: "Terms" },
              { to: "/contact", label: "Contact" }
            ].map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="relative text-gray-400 hover:text-gray-300 transition-all duration-300 font-medium group"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-gray-400 to-gray-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            ))}
          </nav>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500 font-medium">
              © 2025 NetherLink. All rights reserved. 
            </p>
            <p className="text-xs text-gray-600 flex items-center justify-center gap-1.5">
              Built with 
              <span className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse">
                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </span>
              by <span className="text-gray-300 font-semibold">Jens-Co</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50 shadow-lg shadow-gray-400/50"></div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
        
        .elegant-logo {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          letter-spacing: 0.5px;
          filter: drop-shadow(0 0 10px rgba(156, 163, 175, 0.5));
          transition: all 0.3s ease;
        }
        
        .elegant-logo:hover {
          filter: drop-shadow(0 0 20px rgba(156, 163, 175, 0.8));
        }
      `}</style>
    </footer>
  );
}