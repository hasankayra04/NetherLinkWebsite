import { Link } from "react-router-dom";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="glass-tile-nav border-t border-white/20 shadow-inner mt-12 pt-10 pb-7 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg font-extrabold text-blue-600 tracking-tighter">NL</span>
          <span className="font-bold text-blue-900 text-lg">NetherLink</span>
        </div>
        <div className="flex gap-3 mb-6">
          <a
            href="https://discord.gg/xvaNzE35Rs"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-800 transition p-3 rounded-full text-white"
            aria-label="Discord"
          >
            <FaDiscord size={20} />
          </a>
          <a
            href="https://github.com/NetherDevMc/NetherLinkWebsite"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/60 hover:bg-white/80 transition p-3 rounded-full text-blue-700 backdrop-blur"
            aria-label="GitHub"
          >
            <FaGithub size={20} />
          </a>
        </div>
        <nav className="flex flex-wrap gap-5 justify-center mb-5">
          <Link to="/info" className="text-blue-700 hover:underline font-medium">Info</Link>
          <Link to="/privacy" className="text-blue-700 hover:underline font-medium">Privacy</Link>
          <Link to="/terms" className="text-blue-700 hover:underline font-medium">Terms</Link>
          <Link to="/contact" className="text-blue-700 hover:underline font-medium">Contact</Link>
        </nav>
        <div className="text-center text-blue-900 text-sm font-light">
          © {new Date().getFullYear()} NetherLink. Built by <span className="font-semibold text-blue-700">Jens-Co</span>.
        </div>
      </div>
      <style jsx="true">{`
        .glass-tile-nav {
          background: linear-gradient(115deg,rgba(255,255,255,0.54),rgba(158,235,255,0.13) 100%);
          box-shadow: 0 1.5px 14px 0 rgba(50,100,255,0.07);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
      `}</style>
    </footer>
  );
}